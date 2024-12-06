class AddPackToCustomReaction < ActiveRecord::Migration[7.1]
  def change
    add_column :custom_reactions, :pack, :integer, null: true
  end
end
