class AddFollowerMemberIdToFollows < ActiveRecord::Migration[7.0]
  def change
    add_column :follows, :follower_member_id, :bigint, unsigned: true
    add_index :follows, :follower_member_id
  end
end
