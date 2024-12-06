class ChangeFigmaNodeNameColumnToText < ActiveRecord::Migration[7.1]
  def up
    change_column :attachments, :remote_figma_node_name, :text
  end

  def down
    change_column :attachments, :remote_figma_node_name, :string
  end
end
