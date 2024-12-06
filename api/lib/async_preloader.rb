# frozen_string_literal: true

class AsyncPreloader
  def self.value(value)
    new(value) { |v| v }
  end

  def initialize(relation, &block)
    @relation = relation
    @block = block
  end

  def value
    @value ||= @block.call(@relation.is_a?(ActiveRecord::Promise) ? @relation.value : @relation)
  end
end
