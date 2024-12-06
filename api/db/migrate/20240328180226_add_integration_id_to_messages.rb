class AddIntegrationIdToMessages < ActiveRecord::Migration[7.1]
  def change
    add_reference :messages, :integration, unsigned: true
  end
end
