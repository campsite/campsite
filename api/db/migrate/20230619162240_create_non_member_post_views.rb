class CreateNonMemberPostViews < ActiveRecord::Migration[7.0]
  def change
    create_table :non_member_post_views, id: { type: :bigint, unsigned: true } do |t|
      t.references :post, unsigned: true, null: false
      t.references :user, unsigned: true, null: true
      t.string :anonymized_ip, null: false
      t.string :user_agent, null: true

      t.timestamps
    end

    add_index :non_member_post_views, [:post_id, :user_id]
    add_index :non_member_post_views, [:post_id, :anonymized_ip, :user_agent], name: "idx_non_member_post_views_on_post_ip_and_user_agent"
  end
end
