# frozen_string_literal: true

class CursorPagination
  DEFAULT_PER_PAGE = 50
  MAX_PER_PAGE = 100

  def initialize(options = {})
    (options || {}).to_hash.symbolize_keys!
    @scope = options[:scope]
    @direction = options[:before].present? ? :before : :after
    @cursor_id = options[@direction]
    @order = if options[:order].nil?
      { id: :asc }
    elsif options[:order].is_a?(Symbol)
      { id: options[:order] }
    elsif options[:order].is_a?(Hash)
      options[:order]
    else
      raise ArgumentError, "Invalid order: #{options[:order].inspect}"
    end
    @order[:id] ||= :asc
    @limit = options[:limit] || DEFAULT_PER_PAGE
  end

  def run
    @results = if cursor_record
      where_parts = @order.map.with_index do |(column_name, order), index|
        if index == 0
          next @scope.where(
            "#{table_name}.#{column_name} #{comparator(order: order)} (:cursor_record_value)",
            cursor_record_value: cursor_record[column_name],
          )
        end

        previous_column_name = @order.keys[index - 1]
        previous_order = @order[previous_column_name]

        @scope.where(
          <<~SQL.squish,
            (#{table_name}.#{previous_column_name} #{comparator(order: previous_order)}= (:cursor_record_previous_column_value) OR
              #{table_name}.#{previous_column_name} <=> (:cursor_record_previous_column_value)) AND
            #{table_name}.#{column_name} #{comparator(order: order)} (:cursor_record_value)
          SQL
          cursor_record_previous_column_value: cursor_record[previous_column_name],
          cursor_record_value: cursor_record[column_name],
        )
      end

      where_parts.reduce(&:or)
    else
      @scope
    end

    @order.each do |(column_name, order)|
      @results = @results.order("#{table_name}.#{column_name} #{order == :asc ? "asc" : "desc"}")
    end

    # load an additional item to see if there is a next page
    extended_per_page = per_page + 1

    @results = if @direction == :after
      @results.limit(extended_per_page)
    else
      @results.last(extended_per_page)
    end

    @results = @results.to_a

    @has_more = @results.size > per_page

    # remove the overflow item from the results page
    start_index = @direction == :before && @has_more ? 1 : 0
    @results = @results[start_index...per_page] || []

    self
  end

  attr_reader :results

  delegate :table_name, to: :@scope

  def per_page
    n = @limit.to_i

    if n <= 0
      DEFAULT_PER_PAGE
    elsif MAX_PER_PAGE && MAX_PER_PAGE < n
      MAX_PER_PAGE
    else
      n
    end
  end

  def next_cursor
    @direction == :after && @has_more ? @results.last.public_id : nil
  end

  def prev_cursor
    @direction == :before && @has_more ? @results.first.public_id : nil
  end

  def cursor_record
    return unless @cursor_id

    @cursor_record ||= @scope.find_by(public_id: @cursor_id)
  end

  def comparator(order:)
    if order == :asc
      @direction == :after ? ">" : "<"
    else
      @direction == :after ? "<" : ">"
    end
  end

  def total_count
    @scope.size
  end
end
