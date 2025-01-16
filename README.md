---
layout: layouts/base.njk
permalink: /
---

<hgroup>
  <h1>task</h1>
  <p>Run any project.</p>
</hgroup>

The task file is a simple bash script and standardized interface for all software projects.

It is to be understood as a software development pattern to standardize the installation, configuration and execution of different software frameworks.

## Specification

The specification is a short guide to setting up a task file for a Python project.

* Create a file `task` in your project.

```bash
touch task
```

* Ensure it is executable.

```bash
chmod +x task
```

* First add the bash shebang.

```bash
#!/bin/bash
```
* Then append the abort on error setting.

```bash
set -e
```

* Load environment variables from the `.env` file.

```bash
if [[ -a ".env" ]]; then
    source .env
fi
```

* Add a help function.

```bash
function help() {
    echo
    echo "task <command> [options]"
    echo
    echo "commands:"
    echo

    # Define column widths
    cmd_width=10
    opt_width=6
    desc_width=40

    # Print table header
    printf "| %-${cmd_width}s | %-${opt_width}s | %-${desc_width}s |\n" "Command" "Option" "Description"
    echo "|$(printf '%*s' $((cmd_width + 2)) '' | tr ' ' '-')|$(printf '%*s' $((opt_width + 2)) '' | tr ' ' '-')|$(printf '%*s' $((desc_width + 2)) '' | tr ' ' '-')|"

    # Print table rows
    printf "| %-${cmd_width}s | %-${opt_width}s | %-${desc_width}s |\n" "all" "" "Run all tasks."
    printf "| %-${cmd_width}s | %-${opt_width}s | %-${desc_width}s |\n" "install" "" "Setup the local environment."
    printf "| %-${cmd_width}s | %-${opt_width}s | %-${desc_width}s |\n" "lint" "" "Run pre-commit and update index.html."
    printf "| %-${cmd_width}s | %-${opt_width}s | %-${desc_width}s |\n" "source" "" "Source the Python virtual env."
    printf "| %-${cmd_width}s | %-${opt_width}s | %-${desc_width}s |\n" "version" "" "Show version of required tools."

    echo
}
```

* Setup the command functions.

```bash
function version() {
    uv --version
}

function install() {
    echo "Setup venv and install python dependencies"
    uv venv env
    source env/bin/activate
    uv pip install pre-commit
}

function lint() {
    source env/bin/activate

    echo "Run pre-commit"
    pre-commit run --all-file
}
```

* Finally finish the file with command switch cases.

```bash
case "$1" in
    help)
        help
        ;;
    all)
        install
        lint
        ;;
    install)
        install
        ;;
    lint)
        lint
        ;;
    source)
        source env/bin/activate
        ;;
    version)
        version
        ;;
    *)
        help
        exit 1;
esac
```

## Usage

Running the task file requires a shell alias: `alias task='./task'`

Show the available commands with `task help`. 

From the specification the project can be installed with `task install`.

To source the Python environment run `source task source`.

Execute all commands with `task all`.

### Completion

With the output of `task help` the task commands can be completed.

Completion for bash: `/etc/bash_completion.d/task_completions`

```bash
#!/bin/bash

_task_completions() {
    local cur prev commands
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    commands=$(./task help | grep -A999 -e '---' | awk '{print $2}' | sed 's/^[[:space:]]*//' | grep -v '^$' | tr '\n' ' ')

    if [[ ${COMP_CWORD} == 1 ]]; then
        COMPREPLY=( $(compgen -W "${commands}" -- "${cur}") )
    elif [[ ${COMP_CWORD} == 2 ]]; then
        COMPREPLY=( $(compgen -f -- "${cur}") )
    else
        COMPREPLY=()
    fi
}

complete -F _task_completions task
```

Completion for zsh: `~/.oh-my-zsh/completions/_task`

```bash
#compdef task

_arguments '1: :->tasks' '*: :_files'

case "$state" in
    tasks)
        args=$(./task help | grep -A999 -e '---' | awk '{print $2}' | sed 's/^[[:space:]]*//' | grep -v '^$' | tr '\n' ' ')
        args="$args help"
        _arguments "1:profiles:($args)"
        ;;
esac
```

## Examples

This website is built with a task file. Here is the source:

```bash
#!/bin/bash
set -e

function help() {
    echo
    echo "task <command> [options]"
    echo
    echo "commands:"
    echo

    # Define column widths
    cmd_width=10
    opt_width=6
    desc_width=40

    # Print table header
    printf "| %-${cmd_width}s | %-${opt_width}s | %-${desc_width}s |\n" "Command" "Option" "Description"
    echo "|$(printf '%*s' $((cmd_width + 2)) '' | tr ' ' '-')|$(printf '%*s' $((opt_width + 2)) '' | tr ' ' '-')|$(printf '%*s' $((desc_width + 2)) '' | tr ' ' '-')|"

    # Print table rows
    printf "| %-${cmd_width}s | %-${opt_width}s | %-${desc_width}s |\n" "all" "" "Run all tasks."
    printf "| %-${cmd_width}s | %-${opt_width}s | %-${desc_width}s |\n" "install" "" "Install node packages."
    printf "| %-${cmd_width}s | %-${opt_width}s | %-${desc_width}s |\n" "dev" "" "Run 11ty server."
    printf "| %-${cmd_width}s | %-${opt_width}s | %-${desc_width}s |\n" "build" "" "Build the 11ty website."
    printf "| %-${cmd_width}s | %-${opt_width}s | %-${desc_width}s |\n" "version" "" "Show version of required tools."

    echo
}


function install() {
    npm install
}

function dev() {
    npx eleventy --serve
}

function build() {
    npx eleventy
}

function version() {
    echo "eleventy: $(npx eleventy --version)"
}

case "$1" in
    help)
        help
        ;;
    all)
        install
        build
        ;;
    install)
        install
        ;;
    dev)
        dev
        ;;
    build)
        build
        ;;
    version)
        version
        ;;
    *)
        help
        exit 1;
esac
```

Source: [janikvonrotz/taskfile.build](https://github.com/janikvonrotz/taskfile.build/blob/main/task)

More examples of task files can be access from these projects:

* [janikvonrotz/dotfiles](https://github.com/janikvonrotz/dotfiles/blob/main/task)
* [janikvonrotz/python.casa](https://github.com/janikvonrotz/python.casa/blob/main/task)
* [Mint-System/Ansible-Build](https://github.com/Mint-System/Ansible-Build/blob/main/task)
* [Mint-System/Odoo-Build](https://github.com/Mint-System/Odoo-Build/blob/16.0/task)
* [Mint-System/Odoo-Wiki](https://github.com/Mint-Wiki/Odoo-Build/blob/main/task)
* [Mint-System/Website](https://github.com/Mint-System/Website/blob/main/task)
* [Mint-System/Wiki](https://github.com/Mint-System/Wiki/blob/main/task)
