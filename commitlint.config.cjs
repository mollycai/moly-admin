module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [ // type枚举
        2, 'always',
        [
          'docs',
          'feat',
          'fix',
          'perf',
          'refactor',
          'style',
          'test',
          'format',
          'merge',
          'depend',
          'chore',
          'del',
        ],
    ],
    'type-empty': [2, 'never'], // never: type不能为空
    'type-case': [0, 'always', 'lower-case'], // type必须小写
    'subject-empty': [2, 'never'], // subject不能为空
    'subject-case': [0],
    'header-max-length': [2, 'always', 108], // header最长108
    'body-leading-blank': [0], // body换行
    'footer-leading-blank': [0, 'always'], // footer以空行开头
  }
}
