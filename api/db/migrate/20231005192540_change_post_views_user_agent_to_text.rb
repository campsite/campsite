class ChangePostViewsUserAgentToText < ActiveRecord::Migration[7.0]
  def up
    remove_index :non_member_post_views, name: "idx_non_member_post_views_on_post_ip_and_user_agent"
    change_column :non_member_post_views, :user_agent, :text
    add_index :non_member_post_views, [:post_id, :anonymized_ip, :user_agent], name: "idx_non_member_post_views_on_post_ip_and_user_agent", length: { user_agent: 320 }
  end

  def down
    remove_index :non_member_post_views, name: "idx_non_member_post_views_on_post_ip_and_user_agent"
    change_column :non_member_post_views, :user_agent, :string
    add_index :non_member_post_views, [:post_id, :anonymized_ip, :user_agent], name: "idx_non_member_post_views_on_post_ip_and_user_agent"
  end
end
