import express from 'express';
import Product from '../schemas/product.schema.js';

const router = express.Router();

//상품 등록 API
router.post('/products', async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ errorMessage: '데이터형식이 올바르지 않습니다.' });
    }

    const { title, content, author, password } = req.body;

    const product = new Product({
      title,
      content,
      author,
      password,
    });
    await product.save();
    return res.status(201).json({ message: '판매 상품을 등록하였습니다.' });
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: '예기치 못한 에러가 발생했습니다.' });
  }
});

//상품 목록 조회 API
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find()
      .select('_id title author status createdAt') //-를 붙이면 이요소들을 배제한다는 뜻이 된다고 함
      .sort({ createdAt: -1 })
      .exec();

    return res.status(200).json({ data: products });
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: '예기치 못한 에러가 발생했습니다.' });
  }
});

//상품 상세 조회 API
router.get('/products/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .select('_id title content author status createdAt')
      .exec();
    if (!product) {
      return res.status(404).json({ message: '상품조회에 실패하였습니다.' });
    }
    return res.status(200).json({ data: product });
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: '예기치 못한 에러가 발생했습니다.' });
  }
});

//상품 정보 수정 API
router.put('/products/:productId', async (req, res) => {
  try {
    if (!req.body || !req.params) {
      return res
        .status(400)
        .json({ message: '데이터 형식이 올바르지 않습니다.' });
    }

    const { title, content, password, status } = req.body;

    const product = await Product.findById(req.params.productId).exec();

    if (!product) {
      return res.status(404).json({ message: '상품조회에 실패하였습니다.' });
    }

    if (String(password) !== product.password) {
      return res
        .status(401)
        .json({ message: '상품을 수정할 권한이 존재하지 않습니다.' });
    }

    product.title = title;
    product.content = content;
    product.status = status;

    await product.save();
    return res.status(200).json({ message: '상품 정보를 수정하였습니다.' });
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: '예기치 못한 에러가 발생했습니다.' });
  }
});

//상품 삭제 API
router.delete('/products/:productId', async (req, res) => {
  try {
    if (!req.body || !req.params) {
      return res
        .status(400)
        .json({ message: '데이터 형식이 올바르지 않습니다.' });
    }

    const { password } = req.body;
    const productId = req.params.productId;

    const product = await Product.findById(req.params.productId).exec();

    if (!product) {
      return res.status(404).json({ message: '상품조회에 실패하였습니다.' });
    }

    if (String(password) !== product.password) {
      return res
        .status(401)
        .json({ message: '상품을 삭제할 권한이 존재하지 않습니다.' });
    }

    await Product.deleteOne({ _id: productId });
    return res.status(200).json({ message: '상품을 삭제하였습니다.' });
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: '예기치 못한 에러가 발생했습니다.' });
  }
});

export default router;
