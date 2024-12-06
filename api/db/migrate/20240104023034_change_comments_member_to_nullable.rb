class ChangeCommentsMemberToNullable < ActiveRecord::Migration[7.1]
  def up
    change_column :comments, :organization_membership_id, :bigint, unsigned: true, null: true
  end
  
  def down
    change_column :comments, :organization_membership_id, :bigint, unsigned: true, null: false
  end
end
