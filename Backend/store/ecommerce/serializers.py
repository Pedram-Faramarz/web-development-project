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


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_name = serializers.ReadOnlyField(source='status.name')
    user_username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'user_username', 'status', 'status_name', 
                  'total_amount', 'shipping_address', 'contact_phone', 
                  'created_at', 'items']
        read_only_fields = ['created_at']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']