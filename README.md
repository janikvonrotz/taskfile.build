---
layout: layouts/base.njk
permalink: /
---

<hgroup>
  <h1>task</h1>
  <p>Run any project.</p>
</hgroup>

The task file is a simple bash script to install, configure and run a software project.

## Specification

The specification is a short tutorial to setup a task file for a python project.

* Create a file `task` in your project.

```bash
touch task
```

* Make sure it is executable.

```bash
chmod +x task
```

* Add the shebang for bash.

```bash
#!/bin/bash
```
* Append the abort on error option.

```bash
set -e
```

* Source the `.env` file.

```bash
if [[ -a ".env" ]]; then
    source .env
fi
```

* Add the help function.

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

* Append the version, install and lint functions.

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

* Finally, add the switch cases.

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

Before running the task a shell alias is required: `alias task='./task'`

Show the available commands with `task help`. 

A project can be installed with `task install`.

To source the env run `source task source`.

All commands can be run with `task all`.

### Completion

With the output of `task help` the task commands can be auto completed.

Completion for bash: **task_completions**

```bash
#!/bin/bash

_task_completions() {
    local cur prev commands
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    # Combine patterns for both formats
    commands=$(./task help | grep -A999 -e '---' | awk '{print $2}' | sed 's/^[[:space:]]*//' | grep -v '^$' | tr '\n' ' ')

    if [[ ${COMP_CWORD} == 1 ]]; then
        # Provide completions for the command part (second word)
        COMPREPLY=( $(compgen -W "${commands}" -- "${cur}") )
    elif [[ ${COMP_CWORD} == 2 ]]; then
        # Provide file path completions for the third parameter
        COMPREPLY=( $(compgen -f -- "${cur}") )
    else
        COMPREPLY=()
    fi
}

complete -F _task_completions task
```

Completion for zsh: **_task**

```bash
#compdef task

_arguments '1: :->tasks' '*: :_files'

case "$state" in
    tasks)
        # Process task list, skip empty lines, and convert to space-separated args
        args=$(./task help | grep -A999 -e '---' | awk '{print $2}' | sed 's/^[[:space:]]*//' | grep -v '^$' | tr '\n' ' ')
        args="$args help"
        _arguments "1:profiles:($args)"
        ;;
esac
```

## Examples

* [janikvonrotz/taskfile.build](https://github.com/janikvonrotz/taskfile.build/blob/main/task)
* [janikvonrotz/dotfiles](https://github.com/janikvonrotz/dotfiles/blob/master/task)
* [Mint-System/Odoo-Build](https://github.com/Mint-System/Odoo-Build/blob/16.0/task)
* [Mint-System/Ansible-Build](https://github.com/Mint-System/Ansible-Build/blob/main/task)
