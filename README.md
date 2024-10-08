# 高速逐次視覚呈示（RSVP）ウェブアプリケーション

このウェブアプリケーションは、視覚刺激研究のための高速逐次視覚呈示（RSVP）実験を実装しています。研究者が一連の画像を高速で呈示し、参加者の反応に関するデータを収集することができます。

## 機能

- ターゲット画像とノンターゲット画像のアップロードと管理
- 刺激呈示周波数の設定
- 安静開眼の計測時間の設定
- ターゲット画像の連続呈示を防ぐオプション
- フルスクリーン表示モード
- CSVデータのエクスポート

## 前提条件

- Node.js（v12以降）
- npm（通常Node.jsに付属）

## セットアップ

1. リポジトリをクローンします：
   ```
   git clone https://github.com/BioSigMatch/RSVP-webapp-server.git
   cd RSVP-webapp-server
   ```

2. 依存関係をインストールします：
   ```
   npm install
   ```

3. プロジェクトルートに以下のディレクトリを作成します：
   - `images/target`: ターゲット画像の保存用
   - `images/nontarget`: ノンターゲット画像の保存用

4. サーバーを起動します：
   ```
   node server.js
   ```

5. ウェブブラウザを開き、`http://localhost:3000` にアクセスします

## 使用方法

1. `/images/target,nontarget` のフォルダに表示させたい画像を入れてください。
2. ウェブインターフェースを使用してパラメータを設定し、実験を開始します。
3. アプリケーションは指定された設定に従って画像を表示します。
4. 実験後、データをCSVファイルとしてエクスポートできます。

## ファイル構造
```
RSVP-webapp-server/
├── README.md
├── images/
│   ├── nontarget/
│   └── target/
├── json/
│   ├── nontarget_images.json
│   └── target_images.json
├── node_modules/
├── public/
│   ├── index.html
│   ├── otherimage/
│   └── sc.js
├── package-lock.json
├── package.json
└── server.js
```
## APIエンドポイント

- GET `/api/images?type=[target|nontarget]`: 画像リストを取得し、JSONとして保存します
- GET `/api/json/:type`: 指定された画像タイプの保存されたJSONファイルを取得します



