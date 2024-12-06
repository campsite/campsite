class AddFigmaNodesToAttachments < ActiveRecord::Migration[7.0]
  def change
    add_column :attachments, :remote_figma_node_id, :string, null: true
    add_column :attachments, :remote_figma_node_type, :integer, null: true
    add_column :attachments, :remote_figma_node_name, :string, null: true
    add_column :attachments, :figma_file_id, :bigint, null: true, unsigned: true

    add_index :attachments, [:figma_file_id, :remote_figma_node_id]
  end
end
