from langchain.tools import Tool, StructuredTool
from langchain_ollama import OllamaLLM
from langchain.agents import initialize_agent, AgentType
from langchain.memory import ConversationBufferMemory

from models.schemas import GetWeather, GetPopulation, GetIncome, CreateTextFile
from tools.info_tools import get_weather, get_population, get_income, create_text_file
from config.settings import OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_TEMPERATURE

def create_tools():
    """创建工具列表
    
    Returns:
        list: 包含天气查询、人口查询和企业收入查询三个工具的列表
    """
    # 创建一个名为 "GetWeather" 的工具实例，用于获取指定城市或地区的天气信息
    weather_tool = Tool(
        # 工具的名称，用于在 Agent 中标识该工具，这个名称在智能体的决策过程中会被使用，
        # 智能体根据用户的输入和工具的描述来决定是否调用某个工具。在日志和调试信息中，也会使用这个名称来标识工具
        name="GetWeather",
        # 该工具实际调用的函数，这里是之前定义的 get_weather 函数
        # 当智能体决定调用某个工具时，会调用这个函数，并传入相应的参数。
        # 在此代码中， func=get_weather 表示当智能体需要获取天气信息时，会调用 get_weather 函数
        func=get_weather,
        # 一个 pydantic 模型，用于定义工具的参数，这里使用了之前定义的 GetWeather 类
        # 这个模型定义了工具函数所需的参数及其类型和描述。智能体在调用工具时，会根据这个模型来验证和解析传入的参数。
        # 在此代码中， args_schema=GetWeather 表示 get_weather 函数需要一个 location 参数，该参数是一个字符串，代表城市或地区名称
        args_schema=GetWeather,
        # 工具的描述信息，帮助 Agent 理解该工具的用途
        # 这个描述帮助智能体理解工具的用途和适用场景。智能体根据用户的输入和工具的描述来判断是否需要调用某个工具。
        # 例如，在此代码中，描述信息为 "使用本工具获取指定城市或地区的天气信息." ，智能体可以根据这个描述来判断是否需要调用 GetWeather 工具
        description="使用本工具获取指定城市或地区的天气信息."
    )

    # 创建一个名为 "GetPopulation" 的工具实例，用于获取指定城市或地区的人口信息
    population_tool = Tool(
        # 工具的名称，用于在 Agent 中标识该工具，这个名称在智能体的决策过程中会被使用，
        # 智能体根据用户的输入和工具的描述来决定是否调用某个工具。在日志和调试信息中，也会使用这个名称来标识工具
        name="GetPopulation",
        # 该工具实际调用的函数，这里是之前定义的 get_population 函数
        # 当智能体决定调用某个工具时，会调用这个函数，并传入相应的参数。
        # 在此代码中， func=get_population 表示当智能体需要获取人口信息时，会调用 get_population 函数
        func=get_population,
        # 一个 pydantic 模型，用于定义工具的参数，这里使用了之前定义的 GetPopulation 类
        # 这个模型定义了工具函数所需的参数及其类型和描述。智能体在调用工具时，会根据这个模型来验证和解析传入的参数。
        # 在此代码中， args_schema=GetPopulation 表示 get_population 函数需要一个 location 参数，该参数是一个字符串，代表城市或地区名称
        args_schema=GetPopulation,
        # 工具的描述信息，帮助 Agent 理解该工具的用途
        # 这个描述帮助智能体理解工具的用途和适用场景。智能体根据用户的输入和工具的描述来判断是否需要调用某个工具。
        # 例如，在此代码中，描述信息为 "使用本工具获取指定城市或地区的人口信息." ，智能体可以根据这个描述来判断是否需要调用 GetPopulation 工具
        description="使用本工具获取指定城市或地区的人口信息."
    )

    # 创建一个名为 "GetIncome" 的工具实例，用于获取指定企业的年收入信息
    # 在 LangChain 中，Tool 和 StructuredTool 都用于定义智能体（Agent）可以使用的工具，但它们有一些区别：
    # - Tool 是一个基础的工具类，适用于简单的工具函数，这些函数通常只接受一个参数。
    # - StructuredTool 是 Tool 的一个子类，它支持更复杂的工具函数，这些函数可以接受多个参数，并且可以使用 Pydantic 模型来定义参数的结构和验证规则。
    # 在这个例子中，由于 get_income 函数接受两个参数（company 和 year），因此使用 StructuredTool 来定义这个工具。
    income_tool = StructuredTool(
        # 工具的名称，用于在 Agent 中标识该工具，这个名称在智能体的决策过程中会被使用，
        # 智能体根据用户的输入和工具的描述来决定是否调用某个工具。在日志和调试信息中，也会使用这个名称来标识工具
        name="GetIncome",
        # 该工具实际调用的函数，这里是之前定义的 get_income 函数
        # 当智能体决定调用某个工具时，会调用这个函数，并传入相应的参数。
        # 在此代码中， func=get_income 表示当智能体需要获取企业年收入信息时，会调用 get_income 函数
        func=get_income,
        # 一个 pydantic 模型，用于定义工具的参数，这里使用了之前定义的 GetIncome 类
        # 这个模型定义了工具函数所需的参数及其类型和描述。智能体在调用工具时，会根据这个模型来验证和解析传入的参数。
        # 在此代码中， args_schema=GetIncome 表示 get_income 函数需要一个 company 参数，该参数是一个字符串，代表企业名称
        args_schema=GetIncome,
        # 工具的描述信息，帮助 Agent 理解该工具的用途
        # 这个描述帮助智能体理解工具的用途和适用场景。智能体根据用户的输入和工具的描述来判断是否需要调用某个工具。
        # 例如，在此代码中，描述信息为 "使用本工具获取指定企业的年收入." ，智能体可以根据这个描述来判断是否需要调用 GetIncome 工具
        description="使用本工具获取指定企业的年收入."
    )

    # 创建一个名为 "CreateTextFile" 的工具实例，用于创建文本文件并写入内容
    text_file_tool = Tool(
        # 工具的名称，用于在 Agent 中标识该工具，这个名称在智能体的决策过程中会被使用，
        # 智能体根据用户的输入和工具的描述来决定是否调用某个工具。在日志和调试信息中，也会使用这个名称来标识工具
        name="CreateTextFile",
        # 该工具实际调用的函数，这里是之前定义的 create_text_file 函数
        # 当智能体决定调用某个工具时，会调用这个函数，并传入相应的参数。
        # 在此代码中， func=create_text_file 表示当智能体需要创建文本文件时，会调用 create_text_file 函数
        func=create_text_file,
        # 一个 pydantic 模型，用于定义工具的参数，这里使用了之前定义的 CreateTextFile 类
        # 这个模型定义了工具函数所需的参数及其类型和描述。智能体在调用工具时，会根据这个模型来验证和解析传入的参数。
        # 在此代码中， args_schema=CreateTextFile 表示 create_text_file 函数需要文件名和内容两个参数
        args_schema=CreateTextFile,
        # 工具的描述信息，帮助 Agent 理解该工具的用途
        # 这个描述帮助智能体理解工具的用途和适用场景。智能体根据用户的输入和工具的描述来判断是否需要调用某个工具。
        # 例如，在此代码中，描述信息为 "使用本工具创建文本文件并写入内容." ，智能体可以根据这个描述来判断是否需要调用 CreateTextFile 工具
        description="使用本工具创建文本文件并写入内容."
    )

    return [weather_tool, population_tool, income_tool, text_file_tool]

def create_llm():
    """创建LLM实例
    
    Returns:
        OllamaLLM: 基于Ollama的大语言模型实例
    """
    return OllamaLLM(
        # 指定 Ollama 模型名称
        model=OLLAMA_MODEL,
        # 指定 Ollama 服务器的地址，用于与模型进行通信
        base_url=OLLAMA_BASE_URL,
        # 指定Ollama模型的随机性参数
        temperature=OLLAMA_TEMPERATURE
    )

def create_agent(tools, llm):
    """创建Agent实例, 即智能体, 用于根据用户输入和可用工具与大语言模型交互
    
    Args:
        tools (list): 工具列表
        llm (BaseLLM): 大语言模型实例
    
    Returns:
        AgentExecutor: 能够使用工具和对话的智能体实例
    """
    return initialize_agent(
        # 工具列表
        tools = tools,
        # 大语言模型实例
        llm = llm,
        # 指定智能体的类型为结构化聊天零样本反应描述类型
        # 这种类型的智能体可以根据工具的描述和用户输入，零样本地决定调用哪个工具来解决问题
        # 常见的智能体类型及使用场景如下：
        # - AgentType.ZERO_SHOT_REACT_DESCRIPTION: 适用于仅根据工具描述和用户输入，零样本地决定调用哪个工具解决问题，不依赖历史对话。
        # - AgentType.REACT_DOCSTORE: 适用于与文档存储交互的场景，例如在文档中查找信息。
        # - AgentType.SELF_ASK_WITH_SEARCH: 适用于需要逐步询问并搜索信息的场景，常用于信息检索。
        # - AgentType.CONVERSATIONAL_REACT_DESCRIPTION: 适用于对话场景，能结合历史对话上下文和工具描述来决定调用工具。
        agent = AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
        # 设置为 True 以查看详细的执行过程，方便调试和监控智能体的决策过程
        verbose = True,
        # 可选参数，用于设置智能体的内存，如 ConversationBufferMemory 用于存储对话历史
        # 例如：memory=ConversationBufferMemory()
        # 当智能体类型为 CONVERSATIONAL_REACT_DESCRIPTION 时，此参数通常需要设置
        memory = ConversationBufferMemory(),

        # 可选参数，用于设置智能体的前缀，可自定义智能体的提示信息
        # 例如：agent_kwargs={"prefix": "这是自定义的提示信息"}
        # agent_kwargs=None,

        # 可选参数，用于设置智能体的最大迭代次数，避免无限循环
        # 例如：max_iterations=5
        # max_iterations=None,

        # 可选参数，用于设置智能体在达到最大迭代次数时是否发出错误
        # 例如：handle_parsing_errors=True
        # handle_parsing_errors=None
    )