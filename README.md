[@zokugun/eslint-tester](https://github.com/zokugun/node-eslint-tester)
=======================================================================

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@zokugun/eslint-tester?color=brightgreen)](https://www.npmjs.com/package/@zokugun/eslint-tester)
[![NodeJS Version](https://img.shields.io/badge/node.js-%3E%3D%2018.20-green)](#requirements)
[![Modules](https://img.shields.io/badge/modules-ESM%20%7C%20CJS-green)](#requirements)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-f87171?logo=kofi&logoColor=white)](https://ko-fi.com/daiyam)
[![Liberapay](https://img.shields.io/badge/Liberapay-facc15?logo=liberapay&logoColor=black)](https://liberapay.com/daiyam/donate)
[![PayPal](https://img.shields.io/badge/PayPal-5277C3?logo=paypal&logoColor=white)](https://paypal.me/daiyam99)

> Test your custom ESLint rules and configurations using a fixture-based approach. Supports dynamic path templates and automated file discovery.

Features
--------

- **Fixture-driven Tests**: Define expected lint results as JSON or YAML files instead of writing repetitive test code by hand.
- **Automatic fixture Discovery**: Walks the specified directory and collects all matching `.json`, `.yaml`, and `.yml` files without manual registration.
- **Auto-Fix Validation**: Checks if the fixed output from ESLint matches the expected result defined in your fixture file.
- **Rule Testing**: Groups test cases by rule name and executes them using `@typescript-eslint/rule-tester`.
- **Flat Config Testing**: Run tests directly against flat ESLint configurations using the native `Linter` class
- **Dynamic Templates**: Use placeholders like `!!RULE!!` to map fixtures to specific rules.
- **Template Variables**: Support for `!!NAME!!` and `!!EXT!!` for flexible filename mapping.

Installation
------------

```bash
npm add @zokugun/eslint-tester
```

Requirements
------------

- **Node.js**: `v18.20` or higher
- **Modules**: ECMAScript Modules (`ESM`) or CommonJS (`CJS`)

Quick Start
-----------

Define your fixture for a specific scenario:

```yaml
# fixtures/complex-format.yaml
input: |
   function foo() {
      var x = 1;
   }
output: |
   function foo() {
      const x = 1;
   }
error:
   - prefer-const
```

Run the configuration test:

```typescript
import { testConfig } from '@zokugun/eslint-tester';
import config from './eslint.config.js';

await testConfig(config, 'fixtures');
```

API Reference
-------------

```typescript
function testConfig(config: Linter.Config[], fixturesDirectory: string): Promise<void>;
function testRules(rules: Record<string, Rule.RuleModule>, fixturesDirectory: string, testerConfig?: RuleTesterConfig): Promise<void>;
```

Contributions
-------------

Contributions are most welcome. Please:

- Open issues and feature requests under the repository discussions.
- Follow the [`CONTRIBUTING.md`](./CONTRIBUTING.md).

Donations
---------

Support this project by becoming a financial contributor.

<table>
   <tr>
      <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_kofi.png" alt="Ko-fi" width="80px" height="80px"></td>
      <td><a href="https://ko-fi.com/daiyam" target="_blank">ko-fi.com/daiyam</a></td>
   </tr>
   <tr>
      <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_liberapay.png" alt="Liberapay" width="80px" height="80px"></td>
      <td><a href="https://liberapay.com/daiyam/donate" target="_blank">liberapay.com/daiyam/donate</a></td>
   </tr>
   <tr>
      <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_paypal.png" alt="PayPal" width="80px" height="80px"></td>
      <td><a href="https://paypal.me/daiyam99" target="_blank">paypal.me/daiyam99</a></td>
   </tr>
</table>

License
-------

Copyright &copy; 2026-present Baptiste Augrain

Licensed under the [MIT license](https://opensource.org/licenses/MIT).
