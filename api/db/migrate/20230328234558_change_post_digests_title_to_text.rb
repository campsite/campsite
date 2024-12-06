# frozen_string_literal: true

class ChangePostDigestsTitleToText < ActiveRecord::Migration[7.0]
  def change
    change_column(:post_digests, :title, :text)
  end
end
