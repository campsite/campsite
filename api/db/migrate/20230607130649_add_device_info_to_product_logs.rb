class AddDeviceInfoToProductLogs < ActiveRecord::Migration[7.0]
  def change
    add_column :product_logs, :device_info, :json
  end
end
