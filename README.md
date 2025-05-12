---
layout: layouts/base.njk
permalink: /
---

<hgroup>
  <h1>./task</h1>
  <p>Run any project.</p>
</hgroup>

![Vercel](https://vercelbadge.vercel.app/api/janikvonrotz/taskfile.build)

---

The task file is a simple bash script and standardized interface for all software projects.

It is to be understood as a software development pattern to standardize the installation, configuration and execution of different software frameworks.

## Specification

The specification is a short guide to setting up a task file for a Python project.

- Create a file `task` in your project.

```bash
touch task
```

- Ensure it is executable.

```bash
chmod +x task
```

- First add the bash shebang.

```bash
#!/bin/bash
```

- Then append the abort on error setting.

```bash
set -e
```

- Load environment variables from the `.env` file.

```bash
if [[ -a ".env" ]]; then
    source .env
fi
```

- Add a help function.

```bash
function help() {
    echo
    echo "task <command> [options]"
    echo
    echo "commands:"
    echo

    # Define column widths
    CMD_WIDTH=10
    OPT_WIDTH=6
    DESC_WIDTH=40
    COLUMN="| %-${CMD_WIDTH}s | %-${OPT_WIDTH}s | %-${DESC_WIDTH}s |\n"

    # Print table header
    printf "$COLUMN" "Command" "Option" "Description"
    echo "|$(printf '%*s' $((CMD_WIDTH + 2)) '' | tr ' ' '-')|$(printf '%*s' $((OPT_WIDTH + 2)) '' | tr ' ' '-')|$(printf '%*s' $((DESC_WIDTH + 2)) '' | tr ' ' '-')|"

    # Print table rows

    printf "$COLUMN" "all" "" "Run all tasks."
    printf "$COLUMN" "install" "" "Setup the local environment."
    printf "$COLUMN" "lint" "" "Run pre-commit and update index.html."
    printf "$COLUMN" "source" "" "Source the Python virtual env."
    printf "$COLUMN" "version" "" "Show version of required tools."
}
```

- Setup the command functions.

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

- Finally finish the file with command switch cases.

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

## Naming

The naming of functions is important. There are basically two styles:

1. Action + Object
2. Object + Action

The task file functions use the first style. The name of the function starts with an action followed by an object. The object name can be singular or plural.

**Examples for actions**: <span id="actions">activate, install, dev, develop, init, build, start, update, remove, delete, enable, disable, template, convert, create, edit, change, get, set, patch, fetch, generate, push, pull, import, export, list, publish, release, test, setup, prepare, restart, stop, store, restore, translate, upgrade, zip, visualize, sync, switch, run, reset, load, dump, checkout, commit, drop, deploy, handle, trigger, render, lint, uninstall, split, parse, fix, refactor, transform, cat, ls, rm, serve, help, show, filter, login, logout, encrypt, decrypt, upload, download, analyse, transpile, compile, minify, copy</span>

**Examples for objects**: <span id="objects">env, venv, submodule, container, database, snippet, model, module, repo, mail, doc, dependency, view, user, vault, file, host, node, log, password, hash, script, requirement, part, component, system, workspace, image, process, state, platform, dir, folder, readme, overview, lang, level, request, response, result, worker, server, proxy, workflow, volume, network, package, field, value, secret, chart, node, edge, function, method, firewall, html, css, image, svg, style, query, native, group, notebook</span>

**Objects can be tools**: <span id="object-tools">odoo, vupress, nodejs, zsh, bash, fish, podman, kind, minikube, helm, nvim, docker, podman, rust, python, tmux, vim, helix, system, git, pass, llm, sql, dotenv, javascript, vue, vite, astro, typescript, turbo, pnpm, eslint, jenkins, k8s, nextcloud, postgres, metabase, ansible, prometheus, grafana, hugo, deno, bun, babel, panda, gulp, grunt, electron, react, express, mongodb, angular, ionic, meteor, webpack, bower, jupyter</span>

<button id="generate-function-names">Generate Function Names</button> <ul id="function-names"> <!-- Random function names will be inserted here by JS --> </ul>

## Patterns

The task file showed above is very basic. Commands can have parameters and call each other. The following is a collection of more complex task file patterns.

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
    if test -z "$1"; then
        echo "\$1 is empty. Usage:";
        help | grep "${FUNCNAME[0]}"
        exit 1;
    fi
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
    bin/password-hash
}
```

The Python script: `bin/password-hash`

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

### Parse and convert a file

With this function you can split a file into multiple parts whenever a specific keyword is matching. In this example the keyword is `!vault`.

```bash
function convert-vault-file() {
    FILE_PATH="$1"
    TEMP_FILE=$(mktemp)
    TEMP_PART_FILE=$(mktemp)
	WRITE_FINISHED=false

	while IFS= read -r LINE; do
		# Check for keyword
		if [[ "$LINE" =~ "!vault" ]]; then
			# Process part if ready to write
			if [ "$WRITE_FINISHED" ] && [ -s "$TEMP_PART_FILE" ]; then
				# Decrypt part file and write to assemble file
				ansible-vault decrypt "$TEMP_PART_FILE"
				KEY=$(echo "$LINE" | cut -d':' -f1)
				VALUE=$(cat "$TEMP_PART_FILE")
				echo "$KEY: $VALUE" >> "$TEMP_FILE"
			fi
			# Clear the file
			: > "$TEMP_PART_FILE"
			# Flag as ready to write
			WRITE_FINISHED=true
		else
			if [ "$WRITE_FINISHED" ]; then
				# Pipe into part file
				echo "$LINE" >> "$TEMP_PART_FILE"
			fi
		fi
	done < "$FILE_PATH"

	# Output assembled file
	cat "$TEMP_FILE"
	# Cleanup temp files
	rm -f "$TEMP_FILE"
	rm -f "$TEMP_PART_FILE"
}
```

### Process data

This pattern tries to match the worklow of a jupyter notebook. Create a folder with the data processing scripts:

```
scripts
├── 01_import-mail-data
├── 02_transform-mail-data
└── 03_export-mail-data
```

The following function lists the scripts and asks for the number of scripts to run. Every script until the entered number is concatenated and executed.

```bash
function process-data() {
    while true; do
        SCRIPTS=($(ls scripts))

        echo -e "Available scripts:\n"
        for INDEX in "${!SCRIPTS[@]}"; do
            echo "$((INDEX+1)): ${SCRIPTS[$INDEX]}"
        done
        echo ""
        read -p "Enter the number of scripts to run (or 'q' to quit): " USER_INPUT
        if [ "${USER_INPUT}" = "q" ]; then
            break
        fi

        TEMP_FILE=$(mktemp)
        for INDEX in "${!SCRIPTS[@]}"; do
            if [ $USER_INPUT -ge $((INDEX+1)) ]; then
                cat "scripts/${SCRIPTS[$INDEX]}" >> "$TEMP_FILE"
                echo >> "$TEMP_FILE"
            fi
        done

        clear
        echo -e "\nPython Output:\n\n---"
        python "$TEMP_FILE"
        EXIT_CODE=$?
        echo -e "---\n"
        echo -e "Exit code: $EXIT_CODE\n"
        rm "$TEMP_FILE"
    done
}
```

## Usage

Running the task file requires a shell alias: `alias task='./task'`\
Show the available commands with `task help`.\
From the specification the project can be installed with `task install`.\
To source the Python environment run `source task source`.\
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
            - 'main'
    push:
        branches:
            - 'main'

jobs:
    task-all:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-python@v5
              with:
                  python-version: '3.12'
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

This website is built with a `task` file. Here is the source:

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
    CMD_WIDTH=10
    OPT_WIDTH=6
    DESC_WIDTH=40
    COLUMN="| %-${CMD_WIDTH}s | %-${OPT_WIDTH}s | %-${DESC_WIDTH}s |\n"

    # Print table header
    printf "$COLUMN" "Command" "Option" "Description"
    echo "|$(printf '%*s' $((CMD_WIDTH + 2)) '' | tr ' ' '-')|$(printf '%*s' $((OPT_WIDTH + 2)) '' | tr ' ' '-')|$(printf '%*s' $((DESC_WIDTH + 2)) '' | tr ' ' '-')|"

    # Print table rows

    printf "$COLUMN" "all" "" "Run all tasks."
    printf "$COLUMN" "build" "" "Build the 11ty website."
    printf "$COLUMN" "dev" "" "Run 11ty server."
    printf "$COLUMN" "install" "" "Install node packages."
    printf "$COLUMN" "lint" "" "Lint code with prettier."
    printf "$COLUMN" "run-tests" "" "Test with shellcheck."
    printf "$COLUMN" "serve" "" "Serve the 11ty output folder."
    printf "$COLUMN" "version" "" "Show version of required tools."

    echo
}

# Import commands

source bin/*

# Project commands

function install() {
    npm install
}

function dev() {
    npx eleventy --serve
}

function lint() {
    pnpm exec prettier . --write
}

function run-tests() {
    echo "Test with shellcheck."
    shellcheck task
}

function build() {
    npx eleventy
}

function serve() {
    npx serve ./_site
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

- [janikvonrotz/dotfiles](https://github.com/janikvonrotz/dotfiles/blob/main/task)
- [janikvonrotz/python.casa](https://github.com/janikvonrotz/python.casa/blob/main/task)
- [Mint-System/Ansible-Build](https://github.com/Mint-System/Ansible-Build/blob/main/task)
- [Mint-System/Kubernetes-Build](https://github.com/Mint-System/Kubernetes-Build/blob/main/task)
- [Mint-System/Odoo-Build](https://github.com/Mint-System/Odoo-Build/blob/16.0/task)
- [Mint-System/Odoo-Wiki](https://github.com/Mint-Wiki/Odoo-Build/blob/main/task)
- [Mint-System/Website](https://github.com/Mint-System/Website/blob/main/task)
- [Mint-System/Wiki](https://github.com/Mint-System/Wiki/blob/main/task)

## Library

The repository of this website provides a library of reusable functions.

Clone the repository into your home folder:

```bash
cd ~
git clone git@github.com:janikvonrotz/taskfile.build.git
```

In your task file you can import these functions from the taskfile library.

### commit-with-llm

```bash
    printf "$COLUMN" "commit-with-llm" "" "Commit with llm generated commit message."

# Import commands

[ -f ~/taskfile.build/bin/commit-with-llm ] && source ~/taskfile.build/bin/commit-with-llm
```

### list-env

```bash
    printf "$COLUMN" "list-env" "" "List env files."

# Import commands

[ -f ~/taskfile.build/bin/list-env ] && source ~/taskfile.build/bin/list-env
```

### show-env

```bash
    printf "$COLUMN" "show-env" "[env]" "Output content of the env file."

# Import commands

[ -f ~/taskfile.build/bin/show-env ] && source ~/taskfile.build/bin/show-env
```


### edit-env

```bash
    printf "$COLUMN" "edit-env" "[env]" "Open env file in default editor."

# Import commands

[ -f ~/taskfile.build/bin/edit-env ] && source ~/taskfile.build/bin/edit-env
```

### load-env

```bash
    printf "$COLUMN" "load-env" "[env]" "Load and export env file."

# Import commands

[ -f ~/taskfile.build/bin/load-env ] && source ~/taskfile.build/bin/load-env
```