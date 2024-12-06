class AddAttachmentIdToPostComments < ActiveRecord::Migration[7.0]
  def change
    add_reference :post_comments, :attachment, type: :bigint, null: true, unsigned: true
  end
end
