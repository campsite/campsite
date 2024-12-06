import { refractor } from 'refractor'
import bash from 'refractor/lang/bash.js'
import clike from 'refractor/lang/clike.js'
import clojure from 'refractor/lang/clojure.js'
import cpp from 'refractor/lang/cpp.js'
import csharp from 'refractor/lang/csharp.js'
import css from 'refractor/lang/css.js'
import elixir from 'refractor/lang/elixir.js'
import erlang from 'refractor/lang/erlang.js'
import go from 'refractor/lang/go.js'
import graphql from 'refractor/lang/graphql.js'
import groovy from 'refractor/lang/groovy.js'
import haskell from 'refractor/lang/haskell.js'
import hcl from 'refractor/lang/hcl.js'
import ini from 'refractor/lang/ini.js'
import java from 'refractor/lang/java.js'
import javascript from 'refractor/lang/javascript.js'
import json from 'refractor/lang/json.js'
import jsx from 'refractor/lang/jsx.js'
import kotlin from 'refractor/lang/kotlin.js'
import lisp from 'refractor/lang/lisp.js'
import lua from 'refractor/lang/lua.js'
import markup from 'refractor/lang/markup.js'
import nix from 'refractor/lang/nix.js'
import objectivec from 'refractor/lang/objectivec.js'
import ocaml from 'refractor/lang/ocaml.js'
import perl from 'refractor/lang/perl.js'
import php from 'refractor/lang/php.js'
import powershell from 'refractor/lang/powershell.js'
import python from 'refractor/lang/python.js'
import ruby from 'refractor/lang/ruby.js'
import rust from 'refractor/lang/rust.js'
import sass from 'refractor/lang/sass.js'
import scala from 'refractor/lang/scala.js'
import scss from 'refractor/lang/scss.js'
import solidity from 'refractor/lang/solidity.js'
import sql from 'refractor/lang/sql.js'
import swift from 'refractor/lang/swift.js'
import toml from 'refractor/lang/toml.js'
import tsx from 'refractor/lang/tsx.js'
import typescript from 'refractor/lang/typescript.js'
import verilog from 'refractor/lang/verilog.js'
import vhdl from 'refractor/lang/vhdl.js'
import visualbasic from 'refractor/lang/visual-basic.js'
import yaml from 'refractor/lang/yaml.js'
import zig from 'refractor/lang/zig.js'

export const ALIAS_TO_LANGUAGE = [
  [bash, 'Bash'] as const,
  [clojure, 'Clojure'] as const,
  [cpp, 'C++'] as const,
  [css, 'CSS'] as const,
  [clike, 'C-Like'] as const,
  [csharp, 'C#'] as const,
  [elixir, 'Elixir'] as const,
  [erlang, 'Erlang'] as const,
  [go, 'Go'] as const,
  [graphql, 'GraphQL'] as const,
  [groovy, 'Groovy'] as const,
  [haskell, 'Haskell'] as const,
  [hcl, 'HCL'] as const,
  [ini, 'INI'] as const,
  [java, 'Java'] as const,
  [javascript, 'JavaScript'] as const,
  [jsx, 'JSX'] as const,
  [json, 'JSON'] as const,
  [kotlin, 'Kotlin'] as const,
  [lisp, 'Lisp'] as const,
  [lua, 'Lua'] as const,
  [markup, 'HTML'] as const,
  [nix, 'Nix'] as const,
  [objectivec, 'Objective-C'] as const,
  [ocaml, 'OCaml'] as const,
  [perl, 'Perl'] as const,
  [php, 'PHP'] as const,
  [python, 'Python'] as const,
  [powershell, 'PowerShell'] as const,
  [ruby, 'Ruby'] as const,
  [rust, 'Rust'] as const,
  [scala, 'Scala'] as const,
  [sql, 'SQL'] as const,
  [solidity, 'Solidity'] as const,
  [sass, 'Sass'] as const,
  [scss, 'SCSS'] as const,
  [swift, 'Swift'] as const,
  [toml, 'TOML'] as const,
  [typescript, 'TypeScript'] as const,
  [tsx, 'TSX'] as const,
  [verilog, 'Verilog'] as const,
  [vhdl, 'VHDL'] as const,
  [visualbasic, 'Visual Basic'] as const,
  [yaml, 'YAML'] as const,
  [zig, 'Zig'] as const
].reduce(
  (acc, [language, name]) => {
    refractor.register(language)
    acc[language.displayName] = name
    language.aliases.forEach((alias) => {
      acc[alias] = name
    })
    return acc
  },
  { none: 'Plain Text' } as Record<string, string>
)
