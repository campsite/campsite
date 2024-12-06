class AddIntegrationIdToComment < ActiveRecord::Migration[7.1]
  def change
    add_reference :comments, :integration, unsigned: true
  end
end
