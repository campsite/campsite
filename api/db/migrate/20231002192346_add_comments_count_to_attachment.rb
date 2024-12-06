class AddCommentsCountToAttachment < ActiveRecord::Migration[7.0]
  def change
    add_column :attachments, :comments_count, :integer, null: false, default: 0
  end
end
