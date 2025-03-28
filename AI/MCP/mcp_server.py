import json
import socket
import socketserver
from typing import Callable, Dict

class MCPServerError(Exception):
    """MCP服务端基础异常"""
    pass

class MCPRequestHandler(socketserver.BaseRequestHandler):
    routes: Dict[str, Callable[[dict], dict]] = {}
    
    def handle(self):
        """处理客户端连接"""
        try:
            # 读取协议头
            header_data = self.request.recv(4)
            if len(header_data) < 4:
                raise MCPServerError("协议头长度不足")
            
            length = int.from_bytes(header_data, 'big')
            payload = self.request.recv(length).decode('utf-8')
            
            # 解析协议报文
            try:
                request = json.loads(payload)
                header = request.get('header', {})
                body = request.get('body', {})
                
                # 版本兼容性检查
                if header.get('version') != '1.0':
                    raise MCPServerError(f"不支持的协议版本: {header.get('version')}")
                
                # 路由分发
                handler = self.routes.get(header['type'])
                if not handler:
                    raise MCPServerError(f"无效的请求类型: {header['type']}")
                
                response_body = handler(body)
                response = {
                    'header': {'status': 'success', 'version': '1.0'},
                    'body': response_body
                }
                
            except (KeyError, json.JSONDecodeError) as e:
                response = self._build_error_response(f"协议解析失败: {str(e)}")
            
            # 发送响应
            response_data = json.dumps(response).encode('utf-8')
            self.request.sendall(len(response_data).to_bytes(4, 'big'))
            self.request.sendall(response_data)
            
        except Exception as e:
            error_response = self._build_error_response(str(e))
            error_data = json.dumps(error_response).encode('utf-8')
            self.request.sendall(len(error_data).to_bytes(4, 'big'))
            self.request.sendall(error_data)

    def _build_error_response(self, message: str) -> dict:
        """构造错误响应"""
        return {
            'header': {
                'status': 'error',
                'version': '1.0',
                'error': message
            },
            'body': {}
        }

class ThreadedMCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    """多线程MCP服务器"""
    daemon_threads = True
    allow_reuse_address = True

# 使用示例
if __name__ == '__main__':
    # 注册请求处理函数
    def handle_data_query(params: dict) -> dict:
        # print(f"收到data_query了类型查询请求: {params}")
        if 'query' not in params:
            raise MCPServerError("缺少query参数")
        else:
            print(f"查询参数: {params['query']}")
            if params['query'] == '北京的常住人口有多少？':
                return {"result": "北京的常住人口有2亿人"}
            elif params['query'] == '幸福无限有限公司的年收入是多少？':
                return {"result": "幸福无限有限公司的年收入是10000亿"}
        return {"result": "sample data"}
    
    MCPRequestHandler.routes['data_query'] = handle_data_query
    
    # 启动服务器
    with ThreadedMCPServer(('0.0.0.0', 8080), MCPRequestHandler) as server:
        print("MCP服务端已启动，监听端口 8080...")
        server.serve_forever()