class DropPostsWorkflowState < ActiveRecord::Migration[7.1]
  def change
    remove_column :posts, :workflow_state, default: "draft", null: false
  end
end
