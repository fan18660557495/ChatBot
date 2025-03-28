import json
from mcp_client import MCPClient

class MCPLLMClient:
    def __init__(self, host: str, port: int):
        """初始化MCP LLM客户端
        
        :param host: MCP服务器地址
        :param port: MCP服务器端口
        """
        self.client = MCPClient(host, port)
        
    def query_filesystem(self, query: str) -> dict:
        """使用LLM处理文件系统查询
        
        :param query: 用户查询
        :return: 查询结果
        """
        # 构造查询参数
        params = {
            'query': query,
            'path': '/Users/esun01/Desktop'  # 从配置文件中获取的路径
        }
        
        # 发送查询请求
        try:
            response = self.client.send_request('filesystem_query', params)
            return response
        except Exception as e:
            return {'error': str(e)}
    
    def query_time(self) -> dict:
        """查询时间服务
        
        :return: 时间查询结果
        """
        try:
            response = self.client.send_request('time_query', {})
            return response
        except Exception as e:
            return {'error': str(e)}

# 使用示例
if __name__ == '__main__':
    # 创建客户端实例
    client = MCPLLMClient('localhost', 8080)
    print(f"MCP LLM客户端已启动，连接地址: {client.client.host}:{client.client.port}")
    
    # 测试时间查询
    result = client.query_time()
    print(f'时间查询结果: {json.dumps(result, ensure_ascii=False, indent=2)}')
    
    # 测试查询
    query = '请列出桌面上的所有PDF文件'
    result = client.query_filesystem(query)
    print(f'查询结果: {json.dumps(result, ensure_ascii=False, indent=2)}')