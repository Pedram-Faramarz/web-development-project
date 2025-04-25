from rest_framework import serializers
from .models import Category, Product,Order,OrderItem,OrderStatus
from django.contrib.auth.models import User


class CategorySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length = 100)
    description = serializers.CharField(required=False, allow_blank = True)


    def create(self, validated_data):
        return Category.objects.create(**validated_data)
    
    def update(self,instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        return instance

class OrderStatusSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=50)
    description = serializers.CharField(required=False, allow_blank=True)
    
    def create(self, validated_data):
        return OrderStatus.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        return instance
    

class ProductSerializer(serializers.ModelSerializer):

    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = "__all__"

        read_only_fields = ['created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'subtotal']


# class OrderSerializer(serializers.ModelSerializer):
#     items = OrderItemSerializer(many=True, read_only=True)
#     status_name = serializers.ReadOnlyField(source='status.name')
#     user_username = serializers.ReadOnlyField(source='user.username')
    
#     class Meta:
#         model = Order
#         fields = ['id', 'user', 'user_username', 'status', 'status_name', 
#                   'total_amount', 'shipping_address', 'contact_phone', 
#                   'created_at', 'items']
#         read_only_fields = ['created_at']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    status_name = serializers.ReadOnlyField(source='status.name')
    user_username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Order
        fields = ['id', 'user', 'user_username', 'status', 'status_name',
                  'total_amount', 'shipping_address', 'contact_phone',
                  'created_at', 'items']
        read_only_fields = ['created_at', 'user', 'user_username', 'status_name']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        order = Order.objects.create(user=user, **validated_data)

        total_amount = 0
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data.get('quantity', 1)
            price = product.price  # You could override this if dynamic pricing is needed
            subtotal = price * quantity

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=price
            )
            total_amount += subtotal

        order.total_amount = total_amount
        order.save()
        return order



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name','is_staff', 'is_superuser']
        read_only_fields = ['id','is_staff', 'is_superuser']