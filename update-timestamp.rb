#!/usr/bin/env ruby

# タイムスタンプを更新するスクリプト
# 使用方法: ruby update-timestamp.rb

require 'time'

# 現在のタイムスタンプを生成
timestamp = Time.now.strftime('%Y%m%d%H%M%S')

# _config.ymlを読み込み
config_file = '_config.yml'
config_content = File.read(config_file)

# タイムスタンプを更新
updated_content = config_content.gsub(
  /timestamp: ".*?"/,
  "timestamp: \"#{timestamp}\""
)

# ファイルに書き戻し
File.write(config_file, updated_content)

puts "タイムスタンプを更新しました: #{timestamp}" 