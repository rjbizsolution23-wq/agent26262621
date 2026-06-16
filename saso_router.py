import os
import requests
import json
from dotenv import load_dotenv

# Load env variables
load_dotenv()

class AIRouter:
    def __init__(self):
        self.openrouter_key = os.getenv("OPENROUTER_API_KEY")
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.deepseek_key = os.getenv("DEEPSEEK_API_KEY")
        self.together_key = os.getenv("TOGETHER_API_KEY")
        
        # Default models
        self.models = {
            "openrouter": {
                "fast": "google/gemini-2.5-flash",
                "reasoning": "deepseek/deepseek-r1",
                "coding": "anthropic/claude-3.5-sonnet",
                "default": "anthropic/claude-3.5-sonnet"
            },
            "groq": {
                "fast": "llama-3.3-70b-specdec",
                "reasoning": "deepseek-r1-distill-llama-70b",
                "default": "llama-3.3-70b-specdec"
            }
        }

    def get_headers(self, provider: str) -> dict:
        """Helper to get authentication and routing headers for each provider."""
        if provider == "openrouter":
            return {
                "Authorization": f"Bearer {self.openrouter_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://rickjeffersonsolutions.com",
                "X-Title": "Supreme AI Swarm Orchestrator"
            }
        elif provider == "groq":
            return {
                "Authorization": f"Bearer {self.groq_key}",
                "Content-Type": "application/json"
            }
        elif provider == "deepseek":
            return {
                "Authorization": f"Bearer {self.deepseek_key}",
                "Content-Type": "application/json"
            }
        elif provider == "together":
            return {
                "Authorization": f"Bearer {self.together_key}",
                "Content-Type": "application/json"
            }
        else:
            raise ValueError(f"Unknown API provider: {provider}")

    def get_url(self, provider: str) -> str:
        """Helper to get base completions API URL."""
        if provider == "openrouter":
            return "https://openrouter.ai/api/v1/chat/completions"
        elif provider == "groq":
            return "https://api.groq.com/openai/v1/chat/completions"
        elif provider == "deepseek":
            return "https://api.deepseek.com/v1/chat/completions"
        elif provider == "together":
            return "https://api.together.xyz/v1/chat/completions"
        else:
            raise ValueError(f"Unknown API provider: {provider}")

    def call_llm(self, system_prompt: str, user_prompt: str, provider: str = "openrouter", model: str = None, temperature: float = 0.2, response_format: dict = None, is_fallback: bool = False) -> str:
        """Sends a blocking post request to the selected LLM provider and returns the text response."""
        url = self.get_url(provider)
        headers = self.get_headers(provider)
        
        # Resolve model key if a general term is used
        model_mappings = {
            "llama-3-free": "meta-llama/llama-3-8b-instruct:free",
            "gemma-2-free": "google/gemma-2-9b-it:free",
            "qwen-2.5-free": "qwen/qwen-2.5-72b-instruct:free",
            "mistral-free": "mistralai/mistral-7b-instruct:free",
            "nvidia-nemotron": "nvidia/llama-3.1-nemotron-70b-instruct"
        }
        if not model:
            model = self.models.get(provider, {}).get("default")
        elif model in ["fast", "reasoning", "coding"]:
            model = self.models.get(provider, {}).get(model, self.models[provider]["default"])
        elif model in model_mappings:
            model = model_mappings[model]

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature
        }

        if response_format:
            payload["response_format"] = response_format

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=120)
            if response.status_code == 200:
                res_data = response.json()
                return res_data["choices"][0]["message"]["content"]
            else:
                error_msg = f"HTTP {response.status_code}: {response.text}"
                print(f"Error calling {provider}: {error_msg}")
                # Fallback to secondary provider if first fails and this is not already a fallback
                if not is_fallback:
                    if provider == "groq" and self.openrouter_key:
                        print("Attempting fallback to openrouter...")
                        return self.call_llm(system_prompt, user_prompt, "openrouter", "fast", temperature, response_format, is_fallback=True)
                    elif provider == "openrouter" and self.groq_key:
                        print("Attempting fallback to groq...")
                        return self.call_llm(system_prompt, user_prompt, "groq", "fast", temperature, response_format, is_fallback=True)
                return f"Error: {error_msg}"
        except Exception as e:
            print(f"Exception during LLM call: {e}")
            if not is_fallback:
                if provider == "groq" and self.openrouter_key:
                    return self.call_llm(system_prompt, user_prompt, "openrouter", "fast", temperature, response_format, is_fallback=True)
                elif provider == "openrouter" and self.groq_key:
                    return self.call_llm(system_prompt, user_prompt, "groq", "fast", temperature, response_format, is_fallback=True)
            return f"Error Exception: {str(e)}"

    def call_llm_stream(self, system_prompt: str, user_prompt: str, provider: str = "openrouter", model: str = None, temperature: float = 0.2):
        """Streams response tokens using standard server-sent events (SSE)."""
        url = self.get_url(provider)
        headers = self.get_headers(provider)
        
        # Resolve model key
        model_mappings = {
            "llama-3-free": "meta-llama/llama-3-8b-instruct:free",
            "gemma-2-free": "google/gemma-2-9b-it:free",
            "qwen-2.5-free": "qwen/qwen-2.5-72b-instruct:free",
            "mistral-free": "mistralai/mistral-7b-instruct:free",
            "nvidia-nemotron": "nvidia/llama-3.1-nemotron-70b-instruct"
        }
        if not model:
            model = self.models.get(provider, {}).get("default")
        elif model in ["fast", "reasoning", "coding"]:
            model = self.models.get(provider, {}).get(model, self.models[provider]["default"])
        elif model in model_mappings:
            model = model_mappings[model]

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "stream": True
        }

        try:
            response = requests.post(url, headers=headers, json=payload, stream=True, timeout=120)
            if response.status_code != 200:
                yield f"Error: HTTP {response.status_code} - {response.text}"
                return

            for line in response.iter_lines():
                if line:
                    decoded = line.decode('utf-8').strip()
                    if decoded.startswith("data: "):
                        data_str = decoded[6:]
                        if data_str == "[DONE]":
                            break
                        try:
                            data_json = json.loads(data_str)
                            content = data_json["choices"][0]["delta"].get("content", "")
                            if content:
                                yield content
                        except:
                            pass
        except Exception as e:
            yield f"\nStream Exception: {str(e)}"

# Self test execution
if __name__ == "__main__":
    router = AIRouter()
    print("Testing AIRouter connectivity...")
    test_res = router.call_llm(
        "You are a helpful assistant.",
        "Say hello in a very professional manner representing RJ Business Solutions.",
        provider="openrouter",
        model="fast"
    )
    print("Response:")
    print(test_res)
