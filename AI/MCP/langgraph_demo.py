from langchain_anthropic import ChatAnthropic
from langgraph.prebuilt import create_react_agent

def search(query: str):
    """Call to surf the web."""
    if "sf" in query.lower() or "san francisco" in query.lower():
        return "It's 60 degrees and foggy."
    return "It's 90 degrees and sunny."

model = ChatAnthropic(model=“claude-3-7-sonnet-latest”)
tools = [search]
agent = create_react_agent(model, tools)
agent.invoke(
    {"messages": [{"role": "user", "content": "what is the weather in sf"}]}
)