// `suiperpower completion bash|zsh` prints a shell completion script to stdout.
// Users source the output: `eval "$(suiperpower completion zsh)"`.

import { BRAND } from "./branding.js";

const COMMANDS = [
  "init",
  "doctor",
  "update",
  "uninstall",
  "skills",
  "repos",
  "mcps",
  "ideas",
  "search",
  "feedback",
  "journey",
  "workspace",
  "workspace-setup",
  "completion",
  "--version",
  "--help",
] as const;

const FLAGS_BY_CMD: Record<string, string[]> = {
  init: ["--vendor", "--agent", "--convex-url"],
  doctor: ["--agent"],
  update: ["--agent", "--skip-npm"],
  uninstall: ["--yes", "--agent"],
  workspace: ["--force", "--agent"],
  "workspace-setup": ["--force", "--agent"],
  feedback: ["--agent"],
};

function bashScript(): string {
  const cmds = COMMANDS.join(" ");
  const lines: string[] = [];
  lines.push(`# bash completion for ${BRAND.PRODUCT_NAME}`);
  lines.push(`_${BRAND.PRODUCT_NAME}_complete() {`);
  lines.push(`  local cur prev`);
  lines.push(`  COMPREPLY=()`);
  lines.push(`  cur="\${COMP_WORDS[COMP_CWORD]}"`);
  lines.push(`  prev="\${COMP_WORDS[COMP_CWORD-1]}"`);
  lines.push(`  if [[ \${COMP_CWORD} -eq 1 ]]; then`);
  lines.push(`    COMPREPLY=( $(compgen -W "${cmds}" -- "\${cur}") )`);
  lines.push(`    return 0`);
  lines.push(`  fi`);
  for (const [cmd, flags] of Object.entries(FLAGS_BY_CMD)) {
    lines.push(`  if [[ "\${COMP_WORDS[1]}" == "${cmd}" ]]; then`);
    lines.push(`    COMPREPLY=( $(compgen -W "${flags.join(" ")}" -- "\${cur}") )`);
    lines.push(`    return 0`);
    lines.push(`  fi`);
  }
  lines.push(`  return 0`);
  lines.push(`}`);
  lines.push(`complete -F _${BRAND.PRODUCT_NAME}_complete ${BRAND.PRODUCT_NAME}`);
  lines.push(`complete -F _${BRAND.PRODUCT_NAME}_complete suiper`);
  return lines.join("\n") + "\n";
}

function zshScript(): string {
  const cmds = COMMANDS.join(" ");
  const lines: string[] = [];
  lines.push(`#compdef ${BRAND.PRODUCT_NAME} suiper`);
  lines.push(`_${BRAND.PRODUCT_NAME}() {`);
  lines.push(`  local -a cmds`);
  lines.push(`  cmds=(${COMMANDS.map((c) => `"${c}"`).join(" ")})`);
  lines.push(`  if (( CURRENT == 2 )); then`);
  lines.push(`    _describe 'command' cmds`);
  lines.push(`    return`);
  lines.push(`  fi`);
  for (const [cmd, flags] of Object.entries(FLAGS_BY_CMD)) {
    lines.push(`  if [[ "\${words[2]}" == "${cmd}" ]]; then`);
    lines.push(`    _values 'flags' ${flags.map((f) => `"${f}"`).join(" ")}`);
    lines.push(`    return`);
    lines.push(`  fi`);
  }
  lines.push(`}`);
  lines.push(`_${BRAND.PRODUCT_NAME} "$@"`);
  return lines.join("\n") + "\n";
}

export async function run(args: string[]): Promise<void> {
  const shell = (args[0] || "").toLowerCase();
  if (shell === "bash") {
    process.stdout.write(bashScript());
    return;
  }
  if (shell === "zsh") {
    process.stdout.write(zshScript());
    return;
  }
  process.stderr.write(
    `${BRAND.PRODUCT_NAME} completion: pass "bash" or "zsh"\nexample: eval "$(${BRAND.PRODUCT_NAME} completion zsh)"\n`,
  );
  process.exitCode = 1;
}
