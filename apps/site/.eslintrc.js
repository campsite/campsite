/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    '@campsite/eslint-config/base.js',
    '@campsite/eslint-config/next.js',
    /**
     * Override default restricted imports inherited from eslint-config/next.js since some rules
     * are not applicable to this `@campsite/site` package. This is a stop gap until we migrate
     * to eslint v9 and hopefully can have a configurable plugin.
     */
    '@campsite/eslint-config/rules/restricted-use-in-view.js'
  ]
}
