class AddNonMemberViewsCountToPosts < ActiveRecord::Migration[7.0]
  def self.up
    add_column :posts, :non_member_views_count, :integer, null: false, default: 0
  end

  def self.down
    remove_column :posts, :non_member_views_count
  end
end
