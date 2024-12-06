# frozen_string_literal: true

class AddPreviousParentIdToPosts < ActiveRecord::Migration[7.0]
  def change
    add_column(:posts, :previous_parent_id, :bigint, unsigned: true)
  end
end
