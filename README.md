# mktute

CLI App for Generating Markdown Tutorials Based on Recent Diffs

### Turn your recent git commits into a step-by-step programming tutorial:

1. Run `mktute`, select start and end commits.
2. Your git diffs are sent to Anthropic's Claude 3 Sonnet or OpenAI's GPT-4-turbo. (You will be asked to set your api key for the selected provider if it is not already accessible from the shell.)
3. mktute generates a first draft of a step-by-step tutorial covering the code you recently committed. The tutorial is automatically saved as a markdown file in the current working directory.

### Use cases:

- Self-documentation
- Drafting internal tutorials for other developers
- Learning in public
- Publish learning residue

### But, why?

- **Knowledge Sharing:** You figured out something while coding that would be highly useful to share with other developers. mktute helps you quickly document your work in a user-friendly format. Publishing tutorials based on **_your actual work_** is one way that you can [learn generously](https://www.recurse.com/self-directives#learn-generously).
- **Fill in Knowledge Gaps:** You're working with a framework that has changed significantly from the last training date of a popular LLM. Or your specific implementation is different from what the LLMs often suggest. Publishing a totorial based on your actual work can help with providing learning resources where LLMs are fall short.
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

### Use

simply type `mktute` in the command line to run the interactive command line user interface.

### Example output and cost

The following tutorial was generated with GPT-4 at a cost of $0.0235:
[How to Center a `<div>` Using TailwindCSS](https://github.com/josephrmartinez/mktute/blob/main/public/Tutorial_2024_06_04_17_50_21.md)

When you run mktute, you will be presented with an option to choose which model you would like to use to generate the tutorial. A price estimation is included with these model selection choices.

### Demo

![mktute gif illustration](public/demo.gif)

### A Note on "Slop"

Please give consideration before publishing tutorials generated with mktute. While mktute lowers the barrier to writing a coding tutorial, you should absolutely spend time thoroughly editing the generated content before publishing.

### Further development:

- Local Model Inference: Implement an option to use local AI models for inference. Reduce cost, dependency on external APIs, and keep all data on device.

- Improve prompt to give the model a tutorial framework and more "time to think"
