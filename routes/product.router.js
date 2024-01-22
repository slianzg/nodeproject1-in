import express from 'express';
import Product from '../schemas/product.schema.js';

const router = express.Router();

//상품 등록 API
router.post('/products', async (req, res) => {
  const { title, content, author, password } = req.body;

  if (!title || !content || !author || !password) {
    return res
      .status(400)
      .json({ errorMessage: '데이터형식이 올바르지 않습니다.' });
  }

  const status = 'FOR_SALE'; //FOR_SALE, SOLD_OUT 두가지 상태를 가지되, default는 FOR_SALE로>> 못함
  const createdAt = new Date();

  const product = new Product({
    title,
    content,
    author,
    password,
    status,
    createdAt,
  });
  await product.save();

  return res.status(201).json({ message: '판매 상품을 등록하였습니다.' });
});

//상품 목록 조회 API
router.get('/products', async (req, res) => {
  const products = await Product.find().sort('-createdAt').exec(); //content랑 password를 res에서 빼고싶다

  let mappedproducts = products.map((obj) => {
    let newobj = {};
    newobj['_id'] = obj._id;
    newobj['title'] = obj.title;
    newobj['author'] = obj.author;
    newobj['status'] = obj.status;
    newobj['createdAt'] = obj.createdAt;

    return newobj;
  });
  return res.status(200).json({ data: mappedproducts });
});

//상품 상세 조회 API
router.get('/products/:productId', async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId).exec(); //password res에서 빼고 싶음
  if (!product) {
    return res.status(404).json({ message: '상품조회에 실패하였습니다.' });
  }
  const { password, ...rest } = product._doc; //product가 res부분에 나오던 깔끔한 객체상태가 아님...
  return res.status(200).json({ data: rest });
});

//상품 정보 수정 API
router.put('/products/:productId', async (req, res) => {
  const { productId } = req.params;
  const { title, content, password, status } = req.body;

  const product = await Product.findById(productId).exec();

  if (!product) {
    return res.status(404).json({ message: '상품조회에 실패하였습니다.' });
  }
  if (!password || !productId) {
    return res
      .status(400)
      .json({ message: '데이터 형식이 올바르지 않습니다.' });
  }
  if (String(password) !== product.password) {
    return res
      .status(401)
      .json({ message: '상품을 수정할 권한이 존재하지 않습니다.' });
  }

  if (title) {
    product.title = title;
  }
  if (content) {
    product.content = content;
  }
  if (status) {
    product.status = status;
  } //얘네 좀 묶어줄수 없나...?

  await product.save();
  return res.status(200).json({ message: '상품 정보를 수정하였습니다.' });
});

//상품 삭제 API
router.delete('/products/:productId', async (req, res) => {
  const { productId } = req.params;
  const { password } = req.body;

  const product = await Product.findById(productId).exec();

  if (!product) {
    return res.status(404).json({ message: '상품조회에 실패하였습니다.' });
  }
  if (!password || !productId) {
    return res
      .status(400)
      .json({ message: '데이터 형식이 올바르지 않습니다.' });
  }
  if (String(password) !== product.password) {
    return res
      .status(401)
      .json({ message: '상품을 삭제할 권한이 존재하지 않습니다.' });
  }

  await Product.deleteOne({ _id: productId });
  return res.status(200).json({ message: '상품을 삭제하였습니다.' });
});

export default router;
