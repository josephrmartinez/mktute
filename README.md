# mktute

CLI App for Generating Markdown Tutorials Based on Recent Diffs

### Turn your recent git commits into a step-by-step programming tutorial:

1. Run `mktute`, select start and end commits.
2. Select whether you would like to use a local AI model, Anthropic's Claude 3 Sonnet, or OpenAI's GPT-4-turbo to generate a step-by-step tutorial covering the code you recently committed.
3. The tutorial is automatically saved as a markdown file in the current working directory.

### Use cases:

- Self-documentation
- Drafting internal tutorials for other developers
- Learning in public
- Publish learning residue

### But, why?

- **Knowledge Sharing:** You figured out something while coding that would be highly useful to share with other developers. mktute helps you quickly document your work in a user-friendly format. Publishing tutorials **_based on your actual work_** is one way that you can [learn generously](https://www.recurse.com/self-directives#learn-generously).

- **Fill in Knowledge Gaps:** You're working with a framework that has changed significantly from the last training date of a popular LLM. Or your specific implementation is different from what the LLMs often suggest. Publishing a totorial based on your actual work can help with providing learning resources where LLMs are falling short.

- **Leverage LLM Strengths:** While LLMs may struggle with generating code from scratch, they are generally very good at summarizing and explaining existing code. By feeding in your actual code changes, mktute leverages a real strength of LLMs to produce high-quality, step-by-step tutorials.

### Installation

Install mktute globally:

```
sudo npm install -g mktute
```

Or just install mktute in the current working directory:

```
npm install mktute
```

### Run

simply type `mktute` in the command line to run the interactive command line user interface.

### Run with Local Model

1. Download the Ollama application: https://ollama.com/download

2. Once installation is complete, open a terminal and run `ollama run llama3`

The first time your type this command, you will pull the llama3 7b model. The model is about 4.7 GB and will take a few minutes to download. mktute currently only uses the llama3 7b model.

3. Close the terminal you used to run `ollama run llama3` **but keep the Ollama application running**.

4. Run `mktute` and select "LOCAL - Ollama Llama 3" when prompted to select an AI provider. When you load the model for the first time, it may take a few seconds to start up. Please keep in mind that local interference performance is highly dependent on your machine's capabilities. You can run llama3 on a consumer grade laptop, but inference may be slow. In some cases, the

When using a local model, the output will print to stdout **and** be saved in a markdown file in the current working directory.

You do not need to be connected to the internet, but you must be running the Ollama application in the background in order to use the local model option with mktute.

### Example output and cost

The following tutorial was generated with GPT-4 at a cost of $0.0235:
[How to Center a `<div>` Using TailwindCSS](https://github.com/josephrmartinez/mktute/blob/main/public/Tutorial_2024_06_04_17_50_21.md)

When you run mktute, you will be presented with an option to choose which model you would like to use to generate the tutorial. A price estimation is included with these model selection choices.

You can also choose to run mktute with a local model to avoid any costs.

### A Note on "Slop"

Please give consideration before publishing tutorials generated with mktute. While mktute lowers the barrier to writing a coding tutorial, you should absolutely spend time thoroughly editing the generated content before publishing.
