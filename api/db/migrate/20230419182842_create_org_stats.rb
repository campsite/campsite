class CreateOrgStats < ActiveRecord::Migration[7.0]
  def change
    create_table :organization_stats, id: { type: :bigint, unsigned: true } do |t|
      t.datetime :dt, null: false
      t.bigint :org_id, null: false, unsigned: true
      t.string :org_name, null: false
      t.string :status, null: false
      t.bigint :members, null: false, unsigned: true
      t.bigint :l1, null: false, unsigned: true
      t.bigint :l7, null: false, unsigned: true
      t.bigint :l28, null: false, unsigned: true
      t.bigint :posts, null: false, unsigned: true
      t.bigint :posters, null: false, unsigned: true
      t.bigint :comments, null: false, unsigned: true
      t.bigint :commenters, null: false, unsigned: true
    end
    add_index :organization_stats, [:org_id]
    add_index :organization_stats, [:dt]
  end
end
