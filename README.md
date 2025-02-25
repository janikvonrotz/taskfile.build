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
if declare -f "$1" > /dev/null; then
    "$1" "${@:2}"
else
    case "$1" in
        all)
            install
            lint
            ;;
        source)
            source env/bin/activate
            ;;
        *)
            echo "Unknown command: $1"
            help
            exit 1
            ;;
    esac
fi
```

### Naming

The naming of functions is important. There are basically two styles:

1. Execution + Object
2. Object + Execution

The task file function use the first style. The name of function starts with the action followed by the object.

## Patterns

The task file showed above is very basic. Commands can have parameters and functions call each other. The following is a collection of more complex task file patterns.

### Set default parameter

Fallback to a default value for a parameter.

```bash
function build() {
    PLATFORM="amd64"
    if [ -n "$1" ]; then
        PLATFORM="$1"
    fi
```

### Ensure parameter is not empty

Check the first param and exit if it is empty.

```bash
function deploy() {
    if test -z "$1"; then echo "\$1 is empty."; exit; fi
```

### Prompt for input

Use `read` to ask for inputs.

```bash
if [ -z "$2" ]; then
	read -p "Enter the task description: " TASK_DESCRIPTION
else
	TASK_DESCRIPTION="$2"
fi
```

### Setup local env vars

Define env vars at the beginning of the task file.

```bash
CONFIGURATION_FILE="file.conf"
GIT_BRANCH=$(git symbolic-ref --short -q HEAD)
```

### Template with env vars

Create a parameterized file from a template. Requires `envsubst`.

```bash
function template-with-env() {
    echo "Template $CONFIGURATION_FILE"

    export CONFIGURATION_1
    export CONFIGURATION_2=${CONFIGURATION_2:="value"}

    envsubst < "file.conf.template" > "$CONFIGURATION_FILE"
}
```

### Create Python virtual env

Initialize Python virtual env with uv.

```bash
function init-venv() {
    if [ ! -d "venv$GIT_BRANCH" ]; then
        echo "Init venv$GIT_BRANCH with $(uv --version)."
        uv venv "venv$GIT_BRANCH"
    fi
}
```

### Activate Python virtual env

```bash
function activate-venv() {
    echo "Source virtualenv venv$GIT_BRANCH."
    source "venv$GIT_BRANCH/bin/activate"
    echo "$(python --version) is active."
}
```

### Call a Python script

Run a Python script.

```bash
function generate-password-hash() {
    activate-venv
    if test -z "$1"; then echo "\$1 is empty."; exit; fi
    PASSWORD_PLAIN="$1"
    scripts/password_hash
}
```

```python
#!/usr/bin/env python3

import os
from passlib.context import CryptContext
crypt_context = CryptContext(schemes=['pbkdf2_sha512', 'plaintext'], deprecated=['plaintext'])

password = os.environ.get('PASSWORD_PLAIN')
print(crypt_context.hash(password))
```

### Command with named parameters

Assuming you have a `docker-compose.yml` and would like to start selected or all containers.

```bash
function start() {    
    
    if [[ "$1" =~ "db" ]]; then
        docker compose up -d db
    fi

    if [[ "$1" =~ "admin" ]]; then
        docker compose up -d admin
        echo "Open http://localhost:8000 url in your browser."
    fi

    if [[ "$1" =~ "odoo" ]]; then
        docker compose up -d odoo
        echo "Open http://localhost:8069 url in your browser."
    fi

    if [[ "$1" =~ "mail" ]]; then
	    docker compose up -d mail
        echo "Open http://localhost:8025 url in your browser."
    fi
}
```

Start all containers with `task start` and selected with `task start db,admin`.

### Run commands in container

Use `docker exec -i` to run commands in a container.

```bash
function drop-db() {
    DATABASE="$1"
    if [ -z "$DATABASE" ]; then
        DATABASE="example"
    fi

    docker exec -i db psql "postgres://odoo:odoo@localhost:5432/postgres" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DATABASE';"
    docker exec -i db psql "postgres://odoo:odoo@localhost:5432/postgres" -c "DROP DATABASE \"$DATABASE\";"
}
```

### Loop over files and folders

Use `for` to loop over file, folders or arrays.

```bash
function render() {
    echo "Update index.html for all folders"
    for FOLDER in ./*; do
        if [ -f "$FOLDER/README.md" ]; then
            cd "$FOLDER" || exit
            md2html README.md _site/index.html
            cd .. || exit
        fi
    done
}
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

### GitHub Actions

Running task file commands in GitHub Actions is highly recommended. This way you can run the same CI/CD procedures in the GitHub runner as you do on your localhost.

The GitHub Actions config is simple: `.github/workflows/test.yml `

```yml
on:
  pull_request:
    branches:
      - "main"
  push:
    branches:
      - "main"

jobs:
  task-all:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install uv
        uses: astral-sh/setup-uv@v5
      - name: Run task install
        run: ./task install
      - name: Run task lint
        run: ./task lint
```

### Jenkins

Run task file commands in Jenkins: `Jenkinsfile`

```groovy
pipeline {

    agent any
    
    stages {
        stage('version') {
            steps {
                script {
                    currentBuild.description = sh (script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                }
                sh './task version'
            }
        }
        stage('install') {
            steps {
                sh './task install'
            }
        }
        stage('lint') {
            steps {
                sh './task lint'
            }
        }
    }
}%         
```
## Example

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

if declare -f "$1" > /dev/null; then
    "$1" "${@:2}"
else
    case "$1" in
        all)
            install
            build
            ;;
        *)
            echo "Unknown command: $1"
            help
            exit 1
            ;;
    esac
fi
```

Source: [janikvonrotz/taskfile.build](https://github.com/janikvonrotz/taskfile.build/blob/main/task)

### More examples

Implementations of the task file standard can be accessed from these projects:

* [janikvonrotz/dotfiles](https://github.com/janikvonrotz/dotfiles/blob/main/task)
* [janikvonrotz/python.casa](https://github.com/janikvonrotz/python.casa/blob/main/task)
* [Mint-System/Ansible-Build](https://github.com/Mint-System/Ansible-Build/blob/main/task)
* [Mint-System/Odoo-Build](https://github.com/Mint-System/Odoo-Build/blob/16.0/task)
* [Mint-System/Odoo-Wiki](https://github.com/Mint-Wiki/Odoo-Build/blob/main/task)
* [Mint-System/Website](https://github.com/Mint-System/Website/blob/main/task)
* [Mint-System/Wiki](https://github.com/Mint-System/Wiki/blob/main/task)
