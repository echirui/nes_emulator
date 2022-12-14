const path = require('path');
module.exports = {
  // モード値を production に設定すると最適化された状態で、
  // development に設定するとソースマップ有効でJSファイルが出力される
  mode: 'production',

  // メインとなるJavaScriptファイル（エントリーポイント）
  entry: [
    './src/index'
  ],
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader',
      include: [path.join(__dirname, '/src')],
    }]
  },
  // import 文で .ts ファイルを解決するため
  // これを定義しないと import 文で拡張子を書く必要が生まれる。
  // フロントエンドの開発では拡張子を省略することが多いので、
  // 記載したほうがトラブルに巻き込まれにくい。
  resolve: {
    // 拡張子を配列で指定
    extensions: [
      '.ts', '.js',
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, '/'),
    contentBasePublicPath: '/',
    openPage: 'index.html',
  },
};
