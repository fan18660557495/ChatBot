import requests
import json
import ollama
import mcp_client

def api_generate(prompt, model="deepseek-r1:32b", timeout=30, server="http://192.168.1.179:11434", data_injection=True):
    """
    调用Ollama API生成文本

    参数:
        server (str): Ollama服务地址（默认http://192.168.1.179:11434）
        data_injection (bool): 是否启用MCP数据注入（默认True）
    """
    client = ollama.Client(host=server)
    # print(client.list())
    
    try:
        final_prompt = prompt
        if data_injection:
            try:
                # MCP数据获取
                with mcp_client.MCPClient(host='localhost', port=8080) as mc:
                    mcp_data = mc.send_request('data_query', {'query': prompt})
                    # 构造最终的提示词
                    final_prompt = f"上下文数据：{mcp_data['result']}\n\t\t用户问题：{prompt}"
                    print(f"最终的提示词: {final_prompt}")
            except mcp_client.MCPClientError as e:
                print(f"MCP数据获取失败: {str(e)}")
        
        response = client.generate(model=model, prompt=final_prompt)
        return response['response']
    except Exception as e:  # 捕获所有异常
        print(f"API请求失败: {str(e)}")



if __name__ == "__main__":
    # 示例用法
    question = "北京的常住人口有多少？"
    print(f"原始问题1: {question}")
    answer = api_generate(question)
    print(f"答案: {answer}")
    # 示例用法
    question = "幸福无限有限公司的年收入是多少？"
    print(f"原始问题2: {question}")
    answer = api_generate(question)
    print(f"答案: {answer}")
    