# frozen_string_literal: true

class RemoveMetadataFromPosts < ActiveRecord::Migration[7.0]
  def change
    remove_column :posts, :metadata, :json
  end
end
