class CreateLlmResponses < ActiveRecord::Migration[7.1]
  def change
    create_table :llm_responses, id: { type: :bigint, unsigned: true } do |t|
      t.references :subject, polymorphic: true, null: false, unsigned: true, index: true
      t.string :invocation_key, null: false, index: true
      t.mediumtext :prompt, null: false
      t.mediumtext :response, null: false
      t.timestamps
    end
  end
end
