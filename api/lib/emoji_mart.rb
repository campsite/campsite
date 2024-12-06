# frozen_string_literal: true

class EmojiMart
  def self.data
    @data ||= begin
      file = File.open("./lib/emoji_mart/data.json")
      JSON.parse(file.read)
    end
  end

  def self.ids
    @ids ||= data["emojis"].keys
  end
end
