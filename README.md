# mktute

CLI Tool for Generating Markdown Tutorials Based on Recent Diffs

### Turn your recent git commits into a step-by-step programming tutorial:

- Run mktute, use the interactive command line user interface to select start and end commits.
- mktute generates a first draft of a step-by-step tutorial covering the code you recently committed. The tutorial is automatically saved as a markdown file in the current working directory.
- Make edits to the tutorial instead of starting from scratch.

### Use cases:

- Self-documentation
- Drafting internal tutorials for other developers
- Learning in public
- Publish learning residue

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

The following tutorial was generated at a cost of $0.0235:
[How to Center a `<div>` Using TailwindCSS](public/Tutorial_2024_06_04_17_50_21.md)

You should expect that generating a tutorial will likely cost **_more_** than the simple example above.

### A Note on Slop

Please give consideration before publishing tutorials generated with mktute. While mktute lowers the barrier to writing a coding tutorial, you should absolutely spend time thoroughly editing the generated content before publishing.
