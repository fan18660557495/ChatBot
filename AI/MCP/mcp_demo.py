from mcp_client import MCPClient, MCPConnectionError, MCPProtocolError

# 正常请求示例
def main():
    # 初始化客户端（带3秒超时）
    client = MCPClient(host='localhost', port=8080, timeout=3)

    try:
        # 发送data_query请求
        response = client.send_request(
            request_type='data_query',
            params={'query': 'sample_filter'}
        )
        print('\n成功收到响应:', response)

    except MCPConnectionError as e:
        print(f'\n连接异常: {str(e)}')
    except MCPProtocolError as e:
        print(f'\n协议错误: {str(e)}')
    finally:
        # 清理连接
        if client._socket:
            client._socket.close()

# 异常处理示例
def error_handling_demo():
    # 使用错误端口触发异常
    bad_client = MCPClient(host='localhost', port=9999)

    try:
        bad_client.send_request('invalid_type', {})
    except MCPConnectionError as e:
        print(f'\n故意触发的连接异常: {str(e)}')

if __name__ == '__main__':
    print('=== 正常请求演示 ===')
    main()

    print('\n=== 异常处理演示 ===')
    error_handling_demo()