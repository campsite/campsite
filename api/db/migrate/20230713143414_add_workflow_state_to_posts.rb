class AddWorkflowStateToPosts < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :workflow_state, :string, null: false, default: "draft"
    add_index :posts, :workflow_state
  end
end
