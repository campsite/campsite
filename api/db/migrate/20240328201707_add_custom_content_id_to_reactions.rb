class AddCustomContentIdToReactions < ActiveRecord::Migration[7.1]
  def change
    add_reference :reactions, :custom_reaction, type: :bigint, null: true, unsigned: true

    change_column_null :reactions, :content, true
  end
end
