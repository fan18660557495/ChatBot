import socket
import json
from typing import Optional

class MCPClientError(Exception):
    """MCP协议基础异常类"""
    pass

class MCPConnectionError(MCPClientError):
    """网络连接异常"""
    pass

class MCPProtocolError(MCPClientError):
    """协议解析异常"""
    pass

class MCPClient:
    def __init__(self, host: str, port: int, timeout: int = 10):
        """
        MCP协议客户端
        
        :param host: 服务器地址
        :param port: 服务器端口
        :param timeout: 超时时间(秒)
        """
        self.host = host
        self.port = port
        self.timeout = timeout
        self._socket = None

    def connect(self):
        """建立与MCP服务器的连接"""
        try:
            self._socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self._socket.settimeout(self.timeout)
            self._socket.connect((self.host, self.port))
        except (socket.timeout, ConnectionRefusedError) as e:
            raise MCPConnectionError(f"连接失败: {str(e)}") from e

    def send_request(self, request_type: str, params: dict) -> dict:
        """
        发送MCP协议请求
        
        :param request_type: 请求类型(如data_query)
        :param params: 请求参数
        :return: 解析后的响应数据
        """
        if not self._socket:
            self.connect()

        try:
            # 构造协议报文
            packet = {
                "header": {
                    "version": "1.0",
                    "type": request_type
                },
                "body": params
            }
            payload = json.dumps(packet).encode('utf-8')
            if self._socket:
                # 发送数据
                self._socket.sendall(len(payload).to_bytes(4, 'big'))
                self._socket.sendall(payload)

                # 接收响应
                length = int.from_bytes(self._socket.recv(4), 'big')
                response = self._socket.recv(length).decode('utf-8')
                
                return self._parse_response(response)
            else:
                raise MCPConnectionError("未连接到服务器")
        except (socket.timeout, BrokenPipeError) as e:
            raise MCPConnectionError(f"通信中断: {str(e)}") from e
        except json.JSONDecodeError as e:
            raise MCPProtocolError(f"响应解析失败: {str(e)}") from e

    def _parse_response(self, response: str) -> dict:
        """解析MCP协议响应"""
        try:
            data = json.loads(response)
            if data.get('header', {}).get('status') != 'success':
                raise MCPProtocolError(f"服务端返回错误: {data.get('error', '未知错误')}")
            return data.get('body', {})
        except KeyError as e:
            raise MCPProtocolError(f"响应格式异常: {str(e)}") from e

    def close(self):
        """关闭连接"""
        if self._socket:
            self._socket.close()
            self._socket = None

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()