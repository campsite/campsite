class CreatePostHierarchies < ActiveRecord::Migration[7.0]
  def change
    create_table :post_hierarchies, id: false do |t|
      t.integer :ancestor_id, null: false
      t.integer :descendant_id, null: false
      t.integer :generations, null: false
    end

    add_index :post_hierarchies, [:ancestor_id, :descendant_id, :generations],
      unique: true,
      name: "post_anc_desc_idx"

    add_index :post_hierarchies, [:descendant_id],
      name: "post_desc_idx"
  end
end
