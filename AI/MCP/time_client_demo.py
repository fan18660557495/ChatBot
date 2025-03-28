from mcp_llm_client import MCPLLMClient

def main():
    # 创建MCP客户端实例
    client = MCPLLMClient('localhost', 8080)
    print("连接到MCP服务器...")
    
    # 查询时间
    result = client.query_time()
    
    if 'error' in result:
        print(f"查询失败: {result['error']}")
    else:
        print(f"纽约时间: {result}")

if __name__ == '__main__':
    main()