# frozen_string_literal: true

require "test_helper"

class EmojiMartTest < ActiveSupport::TestCase
  describe ".ids" do
    it "expects an array of emoji ids" do
      assert_equal 1849, EmojiMart.ids.length
      assert EmojiMart.ids.all? { |id| id.is_a?(String) }
    end
  end
end
