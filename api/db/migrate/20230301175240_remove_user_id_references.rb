class RemoveUserIdReferences < ActiveRecord::Migration[7.0]
  def change
    remove_index  :post_views, name: :index_post_views_on_post_id_and_user_id
    remove_index  :project_memberships, name: :index_project_memberships_on_remindable_and_user_id
    remove_index  :reactions, name: :idx_reactions_on_subject_id_type_and_user_id_and_content

    remove_column :poll_votes, :user_id, :bigint, unsigned: true
    remove_column :post_views, :user_id, :bigint, unsigned: true
    remove_column :post_comments, :user_id, :bigint, unsigned: true
    remove_column :posts, :user_id, :bigint, unsigned: true
    remove_column :project_memberships, :user_id, :bigint, unsigned: true
    remove_column :projects, :member_id, :bigint, unsigned: true
    remove_column :reactions, :user_id, :bigint, unsigned: true
  end
end
