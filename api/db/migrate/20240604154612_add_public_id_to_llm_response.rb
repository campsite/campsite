class AddPublicIdToLlmResponse < ActiveRecord::Migration[7.1]
  def change
    add_column :llm_responses, :public_id, :string, limit: 12
    add_index :llm_responses, :public_id, unique: true
  end
end
